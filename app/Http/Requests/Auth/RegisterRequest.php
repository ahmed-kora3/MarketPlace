<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'     => ['required', 'string', 'min:2', 'max:100'],
            'email'    => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role'     => ['required', 'in:seller,buyer'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'     => 'الاسم مطلوب',
            'email.unique'      => 'البريد الإلكتروني مستخدم بالفعل',
            'password.min'      => 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
            'password.confirmed'=> 'تأكيد كلمة المرور غير متطابق',
            'role.in'           => 'الدور يجب أن يكون seller أو buyer فقط',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'status'  => 'Error',
                'message' => 'Validation failed',
                'data'    => $validator->errors(),
            ], 422)
        );
    }
}
