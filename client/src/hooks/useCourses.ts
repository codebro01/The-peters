import { useState, useEffect } from "react";
import { Course } from "../types";
import courseService from "../services/course.service";

export const useCourses = (filters?: {
  category?: string;
  level?: string;
  search?: string;
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const data = await courseService.getAllCourses(filters);
        setCourses(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to fetch courses");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [filters?.category, filters?.level, filters?.search]);

  return { courses, isLoading, error };
};
