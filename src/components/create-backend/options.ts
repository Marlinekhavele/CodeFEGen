// 

export const languages = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "java", label: "Java" },
  { value: "go", label: "Go" },
  { value: "ruby", label: "Ruby" },
] as const;

export type Language = typeof languages[number]['value'];

export const frameworks: Record<Language, Array<{ value: string; label: string }>> = {
  python: [
    { value: "flask", label: "Flask" },
    { value: "django", label: "Django" },
    { value: "fastapi", label: "FastAPI" },
  ],
  javascript: [
    { value: "express", label: "Express" },
    { value: "nestjs", label: "NestJS" },
  ],
  typescript: [
    { value: "express", label: "Express" },
    { value: "nestjs", label: "NestJS" },
  ],
  java: [
    { value: "spring", label: "Spring Boot" },
  ],
  go: [
    { value: "gin", label: "Gin" },
  ],
  ruby: [
    { value: "rails", label: "Ruby on Rails" },
  ],
} as const;