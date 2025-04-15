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
            CREATE TRIGGER after_product_seo_update
            AFTER UPDATE ON products
            FOR EACH ROW
            BEGIN

              DECLARE title_score INT DEFAULT 0;
              DECLARE description_score INT DEFAULT 0;
              DECLARE total_score INT DEFAULT 0;
              DECLARE grade VARCHAR(20);

              IF (
                (OLD.seo_title IS NOT NULL AND NEW.seo_title IS NOT NULL AND OLD.seo_title <> NEW.seo_title)
                OR (OLD.seo_title IS NULL AND NEW.seo_title IS NOT NULL)
                OR (OLD.seo_title IS NOT NULL AND NEW.seo_title IS NULL)
                OR
                (OLD.seo_description IS NOT NULL AND NEW.seo_description IS NOT NULL AND OLD.seo_description <> NEW.seo_description)
                OR (OLD.seo_description IS NULL AND NEW.seo_description IS NOT NULL)
                OR (OLD.seo_description IS NOT NULL AND NEW.seo_description IS NULL)
              ) THEN

                IF (NEW.seo_title IS NOT NULL) THEN
                    SET title_len = CHAR_LENGTH(NEW.seo_title);
                    IF title_len >= 20 AND title_len < 35 THEN
                        SET title_score = title_score + 5;
                    ELSEIF title_len >= 35 AND title_len <= 50 THEN
                        SET title_score = title_score + 15;
                    ELSEIF title_len > 50 AND title_len <= 70 THEN
                        SET title_score = title_score + 20;
                    ELSEIF title_len > 70 THEN
                        SET title_score = title_score + 10;
                    END IF;
                END IF;

                IF (NEW.seo_description IS NOT NULL) THEN
                    SET desc_len = CHAR_LENGTH(NEW.seo_description);
                    IF desc_len >= 50 AND desc_len < 100 THEN
                        SET description_score = description_score + 10;
                    ELSEIF desc_len >= 100 AND desc_len <= 130 THEN
                        SET description_score = description_score + 15;
                    ELSEIF desc_len > 130 AND desc_len <= 160 THEN
                        SET description_score = description_score + 20;
                    ELSEIF desc_len > 160 THEN
                        SET description_score = description_score + 5;
                    END IF;
                END IF;

                SET total_score = title_score + description_score;

                IF total_score >= 60 THEN
                    SET grade = "excellent";
                ELSEIF total_score >= 45 THEN
                    SET grade = "good";
                ELSEIF total_score >= 30 THEN
                    SET grade = "medium";
                ELSE
                    SET grade = "poor";
                END IF;


                INSERT INTO ai_scores (
                    user_id, product_id, title_score, description_score, total_score, grade, checked_at, created_at, updated_at
                ) VALUES (
                    OLD.user_id, OLD.product_id, title_score, description_score, total_score, grade, NOW(), NOW(), NOW()
                ) ON DUPLICATE KEY UPDATE
                    title_score = VALUES(title_score),
                    description_score = VALUES(description_score),
                    total_score = VALUES(total_score),
                    grade = VALUES(grade),
                    checked_at = VALUES(checked_at),
                    updated_at = VALUES(updated_at);
              END IF;
            END;
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared('DROP TRIGGER IF EXISTS after_product_seo_update');
    }
};
