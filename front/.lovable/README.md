# Casa Plate A Domicile

# MaPlak Casa – Professional Automotive E-commerce Platform

Build a complete, modern, responsive React frontend for a Moroccan automotive service business called **MaPlak Casa**.

## Business concept

MaPlak Casa provides car registration plate services with home delivery and installation in Casablanca, Morocco.

Customers can order registration plates online, provide their personal information, upload their required documents and choose their payment method.

## Technology requirements

- React + TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide icons
- Reusable and modular components
- Clean project architecture

IMPORTANT: Build the frontend only for now. Use realistic mock data and local state. Do not connect Supabase, Firebase or any external database. The application will later connect to a Laravel REST API with MySQL.

## Branding and design

Create a premium automotive visual identity.

- Brand: MaPlak Casa
- Primary colors: Black, white and strong red.
- Style: Modern, premium, minimalist and professional.
- Mobile-first responsive design.
- Smooth and subtle animations.
- High-quality automotive imagery.
- Clear typography and strong CTAs.

## Language support

Implement French and Arabic.

- French is the default language.
- Arabic must support RTL layout.
- Add a language switcher in the navbar.
- Keep translations in separate JSON files.
- Translate all buttons, forms, labels and navigation elements.

## Public website

Create these sections:

1. Navbar with logo, navigation and language selector.
2. Hero section with the headline "Vos plaques MA, directement chez vous".
3. Main CTA: "Commander maintenant".
4. Services section:
   - Plaque avant.
   - Plaque arrière.
   - Paire de plaques.
5. How it works section.
6. Advantages and benefits.
7. Pricing section.
8. FAQ.
9. WhatsApp contact button.
10. Footer.

Prices must be displayed using configurable mock data, not hardcoded throughout components.

## Order process

Create a four-step order wizard.

### Step 1 – Customer information
- Full name.
- Moroccan phone number.
- Optional email.

No customer registration or login must be required.

### Step 2 – Service selection
- Front plate.
- Rear plate.
- Pair of plates.
- Quantity.
- Dynamic price calculation.

### Step 3 – Documents and delivery

Required documents:
- National ID card (CIN) front.
- National ID card (CIN) back.
- Vehicle registration certificate (Carte Grise).

Provide file upload interfaces with previews and validation.

These are demonstration interfaces only. Do not store real personal documents.

Delivery fields:
- Full address.
- Casablanca neighborhood.
- Optional delivery instructions.
- GPS location selection interface.

Only Casablanca is supported.

### Step 4 – Order summary and payment

Show:
- Selected services.
- Quantities.
- Subtotal.
- Delivery fees.
- Total in MAD.

Payment methods:
- Online payment (demonstration only).
- Cash on delivery.

Add terms and privacy acceptance.

## Admin dashboard

Create a separate admin interface with:

- Overview statistics.
- Orders table.
- Order details.
- Services and price management.
- Document review interface using dummy files.
- Delivery management.
- Payment history.
- Order status management.

Use realistic sample orders and customers.

## Important UI requirements

- Every button must have a meaningful demonstration interaction.
- Form validation must work.
- The order wizard must support navigation between steps.
- Price calculations must update dynamically.
- Add loading, empty and success states.
- Ensure excellent mobile responsiveness.
- Use reusable components and avoid duplicated code.

## Future backend integration

Organize API-related code in a separate services directory so that mock data can later be replaced with Axios requests to a Laravel REST API.

Do not implement actual payment processing or real document storage.

The final result should look like a professionally designed commercial platform ready for a real business presentation.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a755f332-fa8a-470d-9b1e-005f64bdfd52).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
