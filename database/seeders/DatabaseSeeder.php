<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create test user
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        // Seed calendar events
        $this->call([
            CalendarEventSeeder::class,
            EmailProviderSeeder::class,
            EmailTemplateSeeder::class,
        ]);

        $this->command->info('✅ Database seeded successfully!');
    }
}
