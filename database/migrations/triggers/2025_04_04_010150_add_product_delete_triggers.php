<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::unprepared('
            CREATE TRIGGER after_product_delete
            AFTER DELETE ON products
            FOR EACH ROW
            BEGIN
                DECLARE old_values JSON;
                DECLARE update_source VARCHAR(50);

                SET update_source = IFNULL(@UPDATE_BY, OLD.updated_by);

                SET old_values = JSON_OBJECT(
                    "title", OLD.title,
                    "handle", OLD.handle,
                    "body_html", OLD.body_html,
                    "product_type", OLD.product_type,
                    "vendor", OLD.vendor,
                    "status", OLD.status,
                    "tags", OLD.tags,
                    "seo_title", OLD.seo_title,
                    "seo_description", OLD.seo_description,
                    "featured_image", OLD.featured_image
                );

                INSERT INTO change_logs (
                    product_id,
                    user_id,
                    event,
                    old_values,
                    new_values,
                    updated_by,
                    created_at,
                    updated_at
                ) VALUES (
                    OLD.product_id,
                    OLD.user_id,
                    "product_delete",
                    old_values,
                    NULL,
                    update_source,
                    NOW(),
                    NOW()
                );
            END;
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared('DROP TRIGGER IF EXISTS after_product_delete');
    }
};
