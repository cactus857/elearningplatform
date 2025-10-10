import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

function CoursesPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Courses</h1>
        <Link href="/dashboard/courses/create" className={buttonVariants()}>
          Create Course
        </Link>
      </div>
      <div>Here you will see all of the courses</div>
    </>
  );
}

export default CoursesPage;
