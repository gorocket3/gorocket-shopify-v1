<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\PersonalColumn;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PersonalController extends Controller
{
    /**
     * Get all personal columns
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $shop = Auth::user();

        $columns = PersonalColumn::where('user_id', $shop->id)
            ->pluck('columns');

        return response()->json([
            'columns' => $columns
        ]);
    }

    /**
     * Get all personal columns
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $shop = Auth::user();

        $validated = $request->validate([
            'columns' => 'required|array'
        ]);
        $validated['user_id'] = $shop->id;

        $columns = PersonalColumn::updateOrCreate(
            ['user_id' => $validated['user_id']],
            $validated
        );

        return response()->json([
            'columns' => $columns
        ], 201);
    }

    /**
     * Delete personal column
     *
     * @return JsonResponse
     */
    public function destroy(): JsonResponse
    {
        $shop = Auth::user();

        PersonalColumn::where('user_id', $shop->id)->delete();

        return response()->json(null, 204);
    }
}
