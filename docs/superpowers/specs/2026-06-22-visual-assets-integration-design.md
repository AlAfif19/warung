# Visual Assets Integration Design

## Goal

Integrate the supplied food, team, testimonial, and article imagery into the website, while turning selected objects from the two 3D composite sheets into reusable transparent decorations that overlap section edges without obscuring content.

## Source Assets

- `database/menu.png`: ten food and drink photographs for menu cards.
- `database/foto tim dan profile user rating.png`: four team portraits and three testimonial portraits.
- `database/thummbnail artikel.png`: three article thumbnails.
- `database/assets 3d.png` and `database/assets 3d 2.png`: composite sheets containing food, drinks, signs, badges, ingredients, and decorative marks.

Source files remain untouched in `database/`. Web-ready derivatives live under `frontend/public/assets/` with lowercase kebab-case names.

## Asset Preparation

### Photographic content

Menu, team, testimonial, and article images will be exported as focused web-ready crops. Menu cutouts retain transparent backgrounds; portraits and article thumbnails retain their intended photographic backgrounds. Files will be compressed to practical web dimensions while preserving enough resolution for responsive cards.

### 3D decorative content

Use image editing to isolate these 12 objects with true transparent backgrounds: burger, fries, fried-chicken platter, iced tea, iced coffee, wooden Warung sign, standing menu board, `100% Segar` badge, `Harga Bersahabat` badge, welcome banner, chili cluster, and leaf cluster. Controls, navigation buttons, and redundant food variants from the source sheets will not be exported.

Each isolated asset must preserve the source object’s dimensional lighting and shadow. No checkerboard background may remain in exported PNGs.

## Website Integration

### Menu page

Replace the current stylized menu-card artwork with crops named for the existing ten items: nasi goreng, nasi rames, nasi ayam bakar, mie goreng, mie rebus, es teh, es jeruk, kopi susu, pisang goreng, and tahu crispy. Existing menu names, filters, prices, cart behavior, and ordering controls remain unchanged. Images use consistent aspect ratios and `object-fit: contain` so dishes are not cropped.

### About page

Use the four supplied staff portraits, read left-to-right from the top row, for the four existing team members in their current order. Use the three customer portraits, read left-to-right from the second row, for the three testimonials. Add the HPP, digital-marketing, and stock-management thumbnails to their matching article cards. Existing text and card order remain unchanged.

### Contextual 3D decoration

- Home: burger, drink, fries, or fried-food assets around the hero and feature sections.
- Menu: wooden sign/menu board and food or drink accents around the menu heading and grid boundaries.
- Calculator: restrained badge or ingredient accents around the progress/form region; no decoration may compete with inputs or results.
- About: Warung sign, welcome banner, and leaf/chili accents around team, testimonial, or article sections.

Decorations are absolutely positioned inside dedicated section wrappers. They use `pointer-events: none`, stay behind interactive content, and overlap no more than roughly 10–15% of a card or section boundary. Content containers remain above decorations through explicit stacking order.

## Responsive and Accessibility Rules

- Desktop may show the complete contextual decoration set.
- Tablet uses smaller assets and reduced offsets.
- Mobile hides nonessential decorations and retains at most one small accent per major section.
- Decorative images use empty alternative text; meaningful menu, team, testimonial, and article images use descriptive Indonesian alternative text.
- Respect reduced-motion preferences; these assets do not introduce continuous animation.

## Performance

- Use Next.js `Image` for meaningful images and ordinary positioned images only where transparent decorative sizing requires it.
- Provide explicit dimensions to prevent layout shift.
- Lazy-load below-the-fold imagery.
- Keep individual derivatives appropriately compressed and avoid loading unused source sheets in production pages.

## Testing

- Verify each menu item, team member, testimonial, and article maps to the intended asset and descriptive alt text.
- Verify decorative assets are non-interactive and content remains in a higher stacking layer.
- Test representative desktop, tablet, and mobile layouts for clipping and content obstruction.
- Run frontend tests, lint, and production build.

## Scope

This work does not change application copy, menu data, prices, cart behavior, calculator logic, routes, or backend behavior. It does not export every object from the composite sheets; only the curated set needed by the approved page design is created.
