<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminLoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(AdminLoginRequest $request): JsonResponse
    {
        $email = strtolower(trim($request->validated('email')));
        $user = User::query()->where('email', $email)->first();

        if ($user === null || $user->role !== 'admin' || ! $user->is_active || ! Hash::check($request->validated('password'), $user->password)) {
            throw ValidationException::withMessages(['email' => 'The provided credentials are invalid.']);
        }

        return response()->json(['data' => [
            'token' => $user->createToken('admin-api')->plainTextToken,
            'user' => ['name' => $user->name, 'email' => $user->email],
        ]]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['data' => [
            'name' => $request->user()->name,
            'email' => $request->user()->email,
        ]]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out.']);
    }
}
