import z from "zod";

export const courseLevels = ["Beginner", "Intermediate", "Advanced"] as const;
export const courseStatus = ["Draft", "Published", "Archived"] as const;
export const courseCategories = [
    "Development",
    "Business",
    "Finance & Accounting",
    "IT & Software",
    "Office Productivity",
    "Personal Development",
    "Design",
    "Marketing",
    "Lifestyle",
    "Photography & Video",
    "Health & Fitness",
    "Music",
    "Teaching & Academics",
] as const;

export const courseSchema = z.object({
    title: z
        .string()
        .min(5, { message: "Title must be at least 5 characters" })
        .max(100, { message: "Title must be at most 100 characters" }),
    description: z
        .string()
        .min(10, { message: "Description must be at least 10 characters" }),
    thumbnail: z.string().optional(),
    level: z.enum(courseLevels, {
        message: "Level must be one of Beginner, Intermediate, Advanced",
    }),
    status: z.enum(courseStatus, {
        message: "Status must be one of Draft, Published, Archived",
    }),
    duration: z.number().optional(),
    slug: z.string().min(3, { message: "Slug must be at least 3 characters" }),
    category: z.enum(courseCategories, {
        message: "Category must be one of the predefined categories",
    }),
    smallDescription: z
        .string()
        .min(3, {
            message: "Small description must be at least 3 characters",
        })
        .max(200, {
            message: "Small description must be at most 200 characters",
        }),
});

export type CourseFormValues = z.infer<typeof courseSchema>;
