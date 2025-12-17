"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, PlusIcon, SparkleIcon, X } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import slugify from "slugify";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import { Uploader } from "@/components/file-uploader/Uploader";
import { createCourse } from "@/services/course.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { getErrorMessage } from "@/utils/error-message";

const courseLevels = ["Beginner", "Intermediate", "Advanced"] as const;
const courseStatus = ["Draft", "Published", "Archived"] as const;
const courseCategories = [
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

const courseSchema = z.object({
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

function CourseCreationPage() {
  const [requirements, setRequirements] = useState<string[]>([]);
  const [whatYouWillLearn, setWhatYouWillLearn] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState("");
  const [newLearning, setNewLearning] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof courseSchema>>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      thumbnail: "",
      level: "Beginner",
      status: "Draft",
      slug: "",
      category: "IT & Software",
      duration: 0,
      smallDescription: "",
    },
  });

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setRequirements([...requirements, newRequirement.trim()]);
      setNewRequirement("");
    }
  };

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const addLearning = () => {
    if (newLearning.trim()) {
      setWhatYouWillLearn([...whatYouWillLearn, newLearning.trim()]);
      setNewLearning("");
    }
  };

  const removeLearning = (index: number) => {
    setWhatYouWillLearn(whatYouWillLearn.filter((_, i) => i !== index));
  };

  async function onSubmit(values: z.infer<typeof courseSchema>) {
    try {
      setIsSubmitting(true);

      const createData = {
        title: values.title,
        description: values.description,
        thumbnail: values.thumbnail,
        level: values.level.toUpperCase() as
          | "BEGINNER"
          | "INTERMEDIATE"
          | "ADVANCED",
        status: values.status.toUpperCase() as
          | "DRAFT"
          | "PUBLISHED"
          | "ARCHIVED",
        slug: values.slug,
        duration: values.duration,
        category: values.category,
        smallDescription: values.smallDescription,
        requirements: requirements,
        whatYouWillLearn: whatYouWillLearn,
      };

      console.log("Creating course with data:", createData);

      const newCourse = await createCourse(createData);

      toast.success("Course created successfully!");
      router.push(`/dashboard/courses/${newCourse.id}/edit`);
    } catch (error: any) {
      console.error("Error creating course:", error);
      console.error("Error response:", error?.response?.data);
      toast.error("Failed to fetch courses", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dashboard/courses"
          className={buttonVariants({
            variant: "outline",
            size: "icon",
          })}
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-2xl font-bold">Create Course</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Provide basic information about the course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Course Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 items-end">
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="Slug" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  className="w-fit"
                  onClick={() => {
                    const title = form.getValues("title");
                    const slug = slugify(title, { lower: true, strict: true });
                    form.setValue("slug", slug, { shouldValidate: true });
                  }}
                >
                  Generate Slug <SparkleIcon className="ml-1" size={16} />
                </Button>
              </div>

              <FormField
                control={form.control}
                name="smallDescription"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Small Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Small Description"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <RichTextEditor field={field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="thumbnail"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Thumbnail Image</FormLabel>
                    <FormControl>
                      <Uploader
                        value={field.value}
                        onChange={(url) => field.onChange(url)}
                        onRemove={() => field.onChange("")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Requirements Section */}
              <div className="space-y-3">
                <FormLabel>Requirements</FormLabel>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {requirements.map((req, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 bg-muted rounded-lg"
                        >
                          <span className="flex-1 text-sm">{req}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeRequirement(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a requirement..."
                          value={newRequirement}
                          onChange={(e) => setNewRequirement(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addRequirement();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addRequirement}
                        >
                          <PlusIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* What You'll Learn Section */}
              <div className="space-y-3">
                <FormLabel>What You Will Learn</FormLabel>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {whatYouWillLearn.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 bg-muted rounded-lg"
                        >
                          <span className="flex-1 text-sm">{item}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeLearning(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a learning outcome..."
                          value={newLearning}
                          onChange={(e) => setNewLearning(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addLearning();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addLearning}
                        >
                          <PlusIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {courseCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {courseLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Duration (hours)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Duration"
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {courseStatus.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoadingSpinner />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Course <PlusIcon className="ml-1" size={16} />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}

export default CourseCreationPage;
