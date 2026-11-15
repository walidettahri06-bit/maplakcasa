<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceCatalogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Service::query()->updateOrCreate(
            ['code' => 'pair'],
            [
                'name_fr' => 'Pack de 2 plaques MA',
                'name_ar' => 'باقة لوحتين MA',
                'description_fr' => 'Deux plaques d’immatriculation au format marocain MA en aluminium de haute qualité, annoncées comme homologuées et acceptées au contrôle technique. Livraison gratuite et pose professionnelle à domicile à Casablanca en moins de 10 minutes.',
                'description_ar' => 'لوحتا تسجيل مغربيتان بصيغة MA من الألومنيوم عالي الجودة، مع التوصيل المجاني والتركيب الاحترافي في المنزل بالدار البيضاء في أقل من 10 دقائق.',
                'price' => 199.00,
                'currency' => 'MAD',
                'lead_time_hours' => 24,
                'is_active' => true,
            ],
        );
    }
}
