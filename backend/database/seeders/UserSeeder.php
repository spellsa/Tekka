<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'username' => 'alice',
                'email' => 'alice@example.com',
                'password' => 'password',
                'profile' => 'Laravelを学習中です。',
            ],
            [
                'username' => 'bob',
                'email' => 'bob@example.com',
                'password' => 'password',
                'profile' => 'Reactが好きです。',
            ],
            [
                'username' => 'charlie',
                'email' => 'charlie@example.com',
                'password' => 'password',
                'profile' => 'PHPとMySQLを勉強しています。',
            ]
        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
}
