<?php
/*
    DatabaseSeeder.php
    初期データを登録する各Seederを呼び出すクラス
    作成者：北 聖也
    作成日：2026年7月22日
*/

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            TagSeeder::class,
            ArticleSeeder::class,
            ArticleEvaluationSeeder::class,
        ]);
    }
}
