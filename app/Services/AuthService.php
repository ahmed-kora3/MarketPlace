<?php

namespace App\Services;

use App\Models\User;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Register a new user and return token.
     */
    public function register(array $data): array
    {
        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => $data['password'], // Auto-hashed via model cast
            'role'     => $data['role'],
        ]);

        $token = $user->createToken('auth_token', [$data['role']])->plainTextToken;

        return ['user' => $user, 'token' => $token];
    }

    /**
     * Login user and return token.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function login(array $credentials): array
    {
        if (!Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        /** @var User $user */
        $user = Auth::user();

        // Revoke all previous tokens on login for security
        $user->tokens()->delete();

        $token = $user->createToken('auth_token', [$user->role])->plainTextToken;

        return ['user' => $user, 'token' => $token];
    }

    /**
     * Logout user by revoking current token.
     */
    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }
}
