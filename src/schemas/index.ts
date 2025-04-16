import * as z from 'zod';

export const CreateBackendFormSchema = z.object({
  project_name: z
    .string()
    .min(1, { message: 'Project name is required.' })
    .min(3, {
      message: 'Project name must be at least 3 characters',
    })
    .regex(/^[a-zA-Z0-9\-\/_ ]*$/, {
      message:
        'Project name can only contain alphanumeric characters, slash, underscore, and hyphen',
    }),
  language: z
    .string()
    .min(1, { message: 'Language is required.' })
    .regex(/^[a-zA-Z]+$/, {
      message: 'Language must only contain alphabetic characters',
    }),
  framework: z
    .string()
    .min(1, { message: 'Framework is required.' })
    .regex(/^[a-zA-Z]+$/, {
      message: 'Framework must only contain alphabetic characters',
    }),
});