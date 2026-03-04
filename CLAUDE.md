## Component Rules
- Use shadcn/ui components for ALL interactive UI (Button, Input, Select, etc.)
- Import from @/components/ui/
- Use cn() from @/lib/utils for conditional classes
- Style with Tailwind utility classes using theme CSS variables
- Never use raw HTML <button>, <input>, <select>, <textarea>
- All interactive elements must be keyboard accessible
- Run `npx shadcn@latest add <component>` to add new components as needed
