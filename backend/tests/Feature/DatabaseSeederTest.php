<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\ArticleEvaluation;
use App\Models\Tag;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_consistent_development_data(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertSame(3, User::count());
        $this->assertSame(5, Tag::count());
        $this->assertSame(4, Article::count());
        $this->assertSame(8, ArticleEvaluation::count());

        $this->assertSame(
            2,
            Article::query()->where('title', 'LaravelでSPA認証を始める')->value('score'),
        );
        $this->assertSame(
            -2,
            Article::query()->where('title', 'Reactコンポーネントを分割する考え方')->value('score'),
        );
        $this->assertSame(102, User::query()->where('username', 'alice')->value('score'));
        $this->assertSame(98, User::query()->where('username', 'bob')->value('score'));
    }
}
