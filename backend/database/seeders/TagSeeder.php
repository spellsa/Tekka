<?php
/*
    TagSeeder.php
    初期表示用のタグを登録するSeeder
    作成者：北 聖也
    作成日：2026年7月22日
*/

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Tag;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tags = [
            [
                'display_name' => 'Laravel',
                'normalized_name' => 'laravel',
            ],
            [
                'display_name' => 'React',
                'normalized_name' => 'react',
            ],
            [
                'display_name' => 'PHP',
                'normalized_name' => 'php',
            ],
            [
                'display_name' => 'JavaScript',
                'normalized_name' => 'javascript',
            ],
            [
                'display_name' => 'MySQL',
                'normalized_name' => 'mysql',
            ],
            [
                'display_name' => 'Processing',
                'normalized_name' => 'processing',
            ],
            [
                'display_name' => 'C',
                'normalized_name' => 'c',
            ],
        ];

        foreach ($tags as $tag) {
            Tag::create($tag);
        }
    }
}
