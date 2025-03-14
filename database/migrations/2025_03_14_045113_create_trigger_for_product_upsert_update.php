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
            CREATE TRIGGER after_product_update
            AFTER UPDATE ON products
            FOR EACH ROW
            BEGIN
                DECLARE old_values JSON;
                DECLARE new_values JSON;
                SET old_values = JSON_OBJECT();
                SET new_values = JSON_OBJECT();

                IF (CASE WHEN OLD.title IS NULL THEN "" ELSE OLD.title END)
                   <> (CASE WHEN NEW.title IS NULL THEN "" ELSE NEW.title END) THEN
                    SET old_values = JSON_SET(old_values, "$.title", OLD.title);
                    SET new_values = JSON_SET(new_values, "$.title", NEW.title);
                END IF;
                IF (CASE WHEN OLD.handle IS NULL THEN "" ELSE OLD.handle END)
                   <> (CASE WHEN NEW.handle IS NULL THEN "" ELSE NEW.handle END) THEN
                    SET old_values = JSON_SET(old_values, "$.handle", OLD.handle);
                    SET new_values = JSON_SET(new_values, "$.handle", NEW.handle);
                END IF;
                IF (CASE WHEN OLD.body_html IS NULL THEN "" ELSE OLD.body_html END)
                   <> (CASE WHEN NEW.body_html IS NULL THEN "" ELSE NEW.body_html END) THEN
                    SET old_values = JSON_SET(old_values, "$.body_html", OLD.body_html);
                    SET new_values = JSON_SET(new_values, "$.body_html", NEW.body_html);
                END IF;
                IF (CASE WHEN OLD.product_type IS NULL THEN "" ELSE OLD.product_type END)
                   <> (CASE WHEN NEW.product_type IS NULL THEN "" ELSE NEW.product_type END) THEN
                    SET old_values = JSON_SET(old_values, "$.product_type", OLD.product_type);
                    SET new_values = JSON_SET(new_values, "$.product_type", NEW.product_type);
                END IF;
                IF (CASE WHEN OLD.vendor IS NULL THEN "" ELSE OLD.vendor END)
                   <> (CASE WHEN NEW.vendor IS NULL THEN "" ELSE NEW.vendor END) THEN
                    SET old_values = JSON_SET(old_values, "$.vendor", OLD.vendor);
                    SET new_values = JSON_SET(new_values, "$.vendor", NEW.vendor);
                END IF;
                IF (CASE WHEN OLD.status IS NULL THEN "" ELSE OLD.status END)
                   <> (CASE WHEN NEW.status IS NULL THEN "" ELSE NEW.status END) THEN
                    SET old_values = JSON_SET(old_values, "$.status", OLD.status);
                    SET new_values = JSON_SET(new_values, "$.status", NEW.status);
                END IF;
                IF (CASE WHEN OLD.tags IS NULL THEN "" ELSE OLD.tags END)
                   <> (CASE WHEN NEW.tags IS NULL THEN "" ELSE NEW.tags END) THEN
                    SET old_values = JSON_SET(old_values, "$.tags", OLD.tags);
                    SET new_values = JSON_SET(new_values, "$.tags", NEW.tags);
                END IF;
                IF (CASE WHEN OLD.published_at IS NULL THEN "" ELSE OLD.published_at END)
                   <> (CASE WHEN NEW.published_at IS NULL THEN "" ELSE NEW.published_at END) THEN
                    SET old_values = JSON_SET(old_values, "$.published_at", OLD.published_at);
                    SET new_values = JSON_SET(new_values, "$.published_at", NEW.published_at);
                END IF;

                IF JSON_LENGTH(new_values) > 0 THEN
                    INSERT INTO change_logs (product_id, user_id, event, old_values, new_values, created_at, updated_at)
                    VALUES (NEW.product_id, NEW.user_id, "update", old_values, new_values, NOW(), NOW());
                END IF;
            END;
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared('DROP TRIGGER IF EXISTS after_product_update');
    }
};
