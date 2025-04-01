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
                DECLARE update_source VARCHAR(50);

                SET update_source = NEW.updated_by;

                SET old_values = JSON_OBJECT();
                SET new_values = JSON_OBJECT();

                IF @DISABLE_PRODUCT_TRIGGER IS NULL THEN
                    IF (CASE WHEN OLD.category IS NULL THEN "" ELSE OLD.category END)
                       <> (CASE WHEN NEW.category IS NULL THEN "" ELSE NEW.category END) THEN
                        SET old_values = JSON_SET(old_values, "$.category", OLD.category);
                        SET new_values = JSON_SET(new_values, "$.category", NEW.category);
                    END IF;
                    IF (CASE WHEN OLD.seo_title IS NULL THEN "" ELSE OLD.seo_title END)
                       <> (CASE WHEN NEW.seo_title IS NULL THEN "" ELSE NEW.seo_title END) THEN
                        SET old_values = JSON_SET(old_values, "$.seo_title", OLD.seo_title);
                        SET new_values = JSON_SET(new_values, "$.seo_title", NEW.seo_title);
                    END IF;
                    IF (CASE WHEN OLD.seo_description IS NULL THEN "" ELSE OLD.seo_description END)
                       <> (CASE WHEN NEW.seo_description IS NULL THEN "" ELSE NEW.seo_description END) THEN
                        SET old_values = JSON_SET(old_values, "$.seo_description", OLD.seo_description);
                        SET new_values = JSON_SET(new_values, "$.seo_description", NEW.seo_description);
                    END IF;
                    IF (CASE WHEN OLD.featured_image IS NULL THEN "" ELSE OLD.featured_image END)
                       <> (CASE WHEN NEW.featured_image IS NULL THEN "" ELSE NEW.featured_image END) THEN
                        SET old_values = JSON_SET(old_values, "$.featured_image", OLD.featured_image);
                        SET new_values = JSON_SET(new_values, "$.featured_image", NEW.featured_image);
                    END IF;
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

                    IF JSON_LENGTH(new_values) > 0 THEN
                        INSERT INTO change_logs (product_id, user_id, event, old_values, new_values, updated_by, created_at, updated_at)
                        VALUES (NEW.product_id, NEW.user_id, "product_update", old_values, new_values, update_source, NOW(), NOW());
                    END IF;
                END IF;
            END;
        ');

        DB::unprepared('
            CREATE TRIGGER after_product_variant_update
            AFTER UPDATE ON product_variants
            FOR EACH ROW
            BEGIN
                DECLARE old_values JSON;
                DECLARE new_values JSON;
                DECLARE update_source VARCHAR(50);

                SET update_source = NEW.updated_by;

                SET old_values = JSON_OBJECT();
                SET new_values = JSON_OBJECT();

                IF (CASE WHEN OLD.title IS NULL THEN "" ELSE OLD.title END)
                   <> (CASE WHEN NEW.title IS NULL THEN "" ELSE NEW.title END) THEN
                    SET old_values = JSON_SET(old_values, "$.title", OLD.title);
                    SET new_values = JSON_SET(new_values, "$.title", NEW.title);
                END IF;
                IF (CASE WHEN OLD.price IS NULL THEN "" ELSE OLD.price END)
                   <> (CASE WHEN NEW.price IS NULL THEN "" ELSE NEW.price END) THEN
                    SET old_values = JSON_SET(old_values, "$.price", OLD.price);
                    SET new_values = JSON_SET(new_values, "$.price", NEW.price);
                END IF;
                IF (CASE WHEN OLD.position IS NULL THEN "" ELSE OLD.position END)
                   <> (CASE WHEN NEW.position IS NULL THEN "" ELSE NEW.position END) THEN
                    SET old_values = JSON_SET(old_values, "$.position", OLD.position);
                    SET new_values = JSON_SET(new_values, "$.position", NEW.position);
                END IF;
                IF (CASE WHEN OLD.inventory_policy IS NULL THEN "" ELSE OLD.inventory_policy END)
                   <> (CASE WHEN NEW.inventory_policy IS NULL THEN "" ELSE NEW.inventory_policy END) THEN
                    SET old_values = JSON_SET(old_values, "$.inventory_policy", OLD.inventory_policy);
                    SET new_values = JSON_SET(new_values, "$.inventory_policy", NEW.inventory_policy);
                END IF;
                IF (CASE WHEN OLD.compare_at_price IS NULL THEN "" ELSE OLD.compare_at_price END)
                   <> (CASE WHEN NEW.compare_at_price IS NULL THEN "" ELSE NEW.compare_at_price END) THEN
                    SET old_values = JSON_SET(old_values, "$.compare_at_price", OLD.compare_at_price);
                    SET new_values = JSON_SET(new_values, "$.compare_at_price", NEW.compare_at_price);
                END IF;
                IF (CASE WHEN OLD.option1 IS NULL THEN "" ELSE OLD.option1 END)
                   <> (CASE WHEN NEW.option1 IS NULL THEN "" ELSE NEW.option1 END) THEN
                    SET old_values = JSON_SET(old_values, "$.option1", OLD.option1);
                    SET new_values = JSON_SET(new_values, "$.option1", NEW.option1);
                END IF;
                IF (CASE WHEN OLD.option2 IS NULL THEN "" ELSE OLD.option2 END)
                   <> (CASE WHEN NEW.option2 IS NULL THEN "" ELSE NEW.option2 END) THEN
                    SET old_values = JSON_SET(old_values, "$.option2", OLD.option2);
                    SET new_values = JSON_SET(new_values, "$.option2", NEW.option2);
                END IF;
                IF (CASE WHEN OLD.option3 IS NULL THEN "" ELSE OLD.option3 END)
                   <> (CASE WHEN NEW.option3 IS NULL THEN "" ELSE NEW.option3 END) THEN
                    SET old_values = JSON_SET(old_values, "$.option3", OLD.option3);
                    SET new_values = JSON_SET(new_values, "$.option3", NEW.option3);
                END IF;
                IF (CASE WHEN OLD.taxable IS NULL THEN "" ELSE OLD.taxable END)
                   <> (CASE WHEN NEW.taxable IS NULL THEN "" ELSE NEW.taxable END) THEN
                    SET old_values = JSON_SET(old_values, "$.taxable", OLD.taxable);
                    SET new_values = JSON_SET(new_values, "$.taxable", NEW.taxable);
                END IF;
                IF (CASE WHEN OLD.barcode IS NULL THEN "" ELSE OLD.barcode END)
                   <> (CASE WHEN NEW.barcode IS NULL THEN "" ELSE NEW.barcode END) THEN
                    SET old_values = JSON_SET(old_values, "$.barcode", OLD.barcode);
                    SET new_values = JSON_SET(new_values, "$.barcode", NEW.barcode);
                END IF;
                IF NOT (OLD.sku IS NULL AND OLD.weight IS NULL AND OLD.weight_unit IS NULL) THEN
                    IF (CASE WHEN OLD.sku IS NULL THEN "" ELSE OLD.sku END)
                       <> (CASE WHEN NEW.sku IS NULL THEN "" ELSE NEW.sku END) THEN
                        SET old_values = JSON_SET(old_values, "$.sku", OLD.sku);
                        SET new_values = JSON_SET(new_values, "$.sku", NEW.sku);
                    END IF;
                    IF (CASE WHEN OLD.weight IS NULL THEN "" ELSE OLD.weight END)
                       <> (CASE WHEN NEW.weight IS NULL THEN "" ELSE NEW.weight END) THEN
                        SET old_values = JSON_SET(old_values, "$.weight", OLD.weight);
                        SET new_values = JSON_SET(new_values, "$.weight", NEW.weight);
                    END IF;
                    IF (CASE WHEN OLD.weight_unit IS NULL THEN "" ELSE OLD.weight_unit END)
                       <> (CASE WHEN NEW.weight_unit IS NULL THEN "" ELSE NEW.weight_unit END) THEN
                        SET old_values = JSON_SET(old_values, "$.weight_unit", OLD.weight_unit);
                        SET new_values = JSON_SET(new_values, "$.weight_unit", NEW.weight_unit);
                    END IF;
                END IF;
                IF (CASE WHEN OLD.inventory_management IS NULL THEN "" ELSE OLD.inventory_management END)
                   <> (CASE WHEN NEW.inventory_management IS NULL THEN "" ELSE NEW.inventory_management END) THEN
                    SET old_values = JSON_SET(old_values, "$.inventory_management", OLD.inventory_management);
                    SET new_values = JSON_SET(new_values, "$.inventory_management", NEW.inventory_management);
                END IF;
                IF (CASE WHEN OLD.inventory_quantity IS NULL THEN "" ELSE OLD.inventory_quantity END)
                   <> (CASE WHEN NEW.inventory_quantity IS NULL THEN "" ELSE NEW.inventory_quantity END) THEN
                    SET old_values = JSON_SET(old_values, "$.inventory_quantity", OLD.inventory_quantity);
                    SET new_values = JSON_SET(new_values, "$.inventory_quantity", NEW.inventory_quantity);
                END IF;
                 IF (CASE WHEN OLD.requires_shipping IS NULL THEN "" ELSE OLD.requires_shipping END)
                   <> (CASE WHEN NEW.requires_shipping IS NULL THEN "" ELSE NEW.requires_shipping END) THEN
                    SET old_values = JSON_SET(old_values, "$.requires_shipping", OLD.requires_shipping);
                    SET new_values = JSON_SET(new_values, "$.requires_shipping", NEW.requires_shipping);
                END IF;
                IF (CASE WHEN OLD.image_id IS NULL THEN "" ELSE OLD.image_id END)
                   <> (CASE WHEN NEW.image_id IS NULL THEN "" ELSE NEW.image_id END) THEN
                    SET old_values = JSON_SET(old_values, "$.image_id", OLD.image_id);
                    SET new_values = JSON_SET(new_values, "$.image_id", NEW.image_id);
                END IF;

                IF JSON_LENGTH(new_values) > 0 THEN
                    INSERT INTO change_logs (product_id, related_id, user_id, event, old_values, new_values, updated_by, created_at, updated_at)
                    VALUES (
                        NEW.product_id,
                        NEW.variant_id,
                        (SELECT user_id FROM products WHERE products.product_id = NEW.product_id LIMIT 1),
                        "product_variant_update",
                        old_values,
                        new_values,
                        update_source,
                        NOW(),
                        NOW()
                    );
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
        DB::unprepared('DROP TRIGGER IF EXISTS after_product_variant_update');
    }
};
