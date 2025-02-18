<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    /**
     * Product List View
     *
     * @param Request $request
     * @return View
     */
    public function index(Request $request): View
    {
        /* Product Status List */
        $sql = "
            SELECT DISTINCT user_id, TRIM(status) AS status
            FROM products,
            JSON_TABLE(
                CONCAT('[\"', REPLACE(tags, ',', '\",\"'), '\"]'),
                '$[*]' COLUMNS (tag VARCHAR(255) PATH '$')
            ) AS tag_table WHERE tag != ''
        ";
        $status = DB::select($sql);
        $status = array_map(fn($row) => $row->status, $status);

        /* Product Tag List */
        $sql = "
            SELECT DISTINCT user_id, TRIM(tag) AS tag
            FROM products,
            JSON_TABLE(
                CONCAT('[\"', REPLACE(tags, ',', '\",\"'), '\"]'),
                '$[*]' COLUMNS (tag VARCHAR(255) PATH '$')
            ) AS tag_table WHERE tag != ''
        ";
        $tags = DB::select($sql);
        $tags = array_map(fn($row) => $row->tag, $tags);

        $values = [
            'status'    => $status,
            'tags'      => $tags,
        ];

        return view('product.list', $values);
    }
}
