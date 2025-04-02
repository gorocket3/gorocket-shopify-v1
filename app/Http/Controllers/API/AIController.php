<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\AIGeneration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use OpenAI;

class AIController extends Controller
{
    /**
     * Generate SEO-friendly title and meta description for a product.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function generateSeo(Request $request): JsonResponse
    {
        $shop = Auth::user();

        $productId = $request->input('product_id');
        $productTitle = $request->input('title');
        $productDescription = $request->input('description');
        $productTags = $request->input('tags');

        $cleanTitle = Str::limit(trim($productTitle), 60);
        $cleanDescription = trim(strip_tags($productDescription));
        $shortDescription = Str::limit($cleanDescription, 250);
        $tagsArray = array_filter(array_map('trim', explode(',', $productTags)));
        $limitedTags = implode(', ', array_slice($tagsArray, 0, 6));

        if (empty($cleanTitle) || mb_strlen($cleanTitle) < 5 || empty($cleanDescription) || mb_strlen($cleanDescription) < 30) {
            return response()->json([
                'error' => 'Invalid input: not enough information for SEO generation.'
            ], 400);
        }

        $client = OpenAI::client(env('OPENAI_API_KEY'));
        $response = $client->chat()->create([
            'model' => env('OPENAI_API_MODEL'),
            'messages' => [
                [
                    'role' => 'system',
                    'content' => "Write an SEO-friendly title (≤70 chars) and meta description (≤160 chars) for a product. Use product name, tags, and description. Make it natural, persuasive, and optimized for Google search. No keyword stuffing."
                ],
                [
                    'role' => 'user',
                    'content' => "Title: {$cleanTitle}\nTags: {$limitedTags}\nDescription: {$shortDescription}"
                ]
            ]
        ]);

        $title = '';
        $description = '';
        $raw = $response['choices'][0]['message']['content'] ?? null;
        if (!$raw) {
            return response()->json([
                'error' => 'Failed to get response from OpenAI.'
            ], 500);
        }

        if (preg_match('/\*\*Title:\*\*\s*(.+)/i', $raw, $titleMatch)) {
            $title = trim($titleMatch[1]);
        }
        if (preg_match('/\*\*Meta Description:\*\*\s*(.+)/i', $raw, $descMatch)) {
            $description = trim($descMatch[1]);
        }

        AIGeneration::create([
            'user_id' => $shop->id,
            'product_id' => $productId,
            'title' => $title,
            'description' => $description,
            'raw_prompt' => [
                'model' => env('OPENAI_API_MODEL'),
                'title' => $cleanTitle,
                'tags' => $limitedTags,
                'description' => $shortDescription
            ],
            'raw_response' => $response
        ]);

        return response()->json([
            'product_id' => $productId,
            'title' => $title,
            'description' => $description,
        ]);
    }
}
