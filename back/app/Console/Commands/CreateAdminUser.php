<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;

class CreateAdminUser extends Command
{
    protected $signature = 'admin:create';

    protected $description = 'Create or update an administrator account securely';

    public function handle(): int
    {
        $name = trim((string) $this->ask('Administrator name'));
        $email = strtolower(trim((string) $this->ask('Administrator email')));
        $password = (string) $this->secret('Administrator password');
        $confirmation = (string) $this->secret('Confirm password');

        $validator = Validator::make(
            ['name' => $name, 'email' => $email, 'password' => $password],
            ['name' => ['required', 'string', 'max:120'], 'email' => ['required', 'email:rfc', 'max:255'], 'password' => ['required', 'string', 'min:12']],
        );

        if ($validator->fails() || $password !== $confirmation) {
            $this->error($validator->errors()->first() ?: 'The password confirmation does not match.');

            return self::FAILURE;
        }

        User::query()->updateOrCreate(
            ['email' => $email],
            ['name' => $name, 'password' => $password, 'role' => 'admin', 'is_active' => true],
        );

        $this->info('Administrator account saved.');

        return self::SUCCESS;
    }
}
