<?php

namespace Tests\Unit;

use App\Http\Controllers\Api\V1\Admin\DocumentController;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentContentResponseTypeTest extends TestCase
{
    public function test_document_content_declares_the_response_returned_by_laravel_stream(): void
    {
        $returnType = (new \ReflectionMethod(DocumentController::class, 'content'))->getReturnType();

        $this->assertNotNull($returnType);
        $this->assertSame(StreamedResponse::class, $returnType->getName());
    }
}
