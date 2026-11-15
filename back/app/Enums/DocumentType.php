<?php

namespace App\Enums;

enum DocumentType: string
{
    case CinFront = 'cin_front';
    case CinBack = 'cin_back';
    case CarteGrise = 'carte_grise';
}
