<?php

namespace Codenidus\VideoConference\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class UserTokenIndexRequest extends FormRequest
{
	/**
	 * Failed validation disable redirect
	 *
	 * @param Validator $validator
	 */
	protected function failedValidation(Validator $validator)
	{
		throw new HttpResponseException(response()->json($validator->errors(), 422));
	}

    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
		return [
			'username' => 'required|string|min:3|max:255',
        ];
    }
}
