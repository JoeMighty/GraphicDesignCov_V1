export type SubmissionStatus = "pending" | "approved" | "rejected";

export type Submission = {
  id: string;
  student_name: string;
  title: string | null;
  image_path: string;
  thumb_path: string;
  width: number;
  height: number;
  instagram_url: string | null;
  behance_url: string | null;
  website_url: string | null;
  status: SubmissionStatus;
  created_at: string;
  reviewed_at: string | null;
};
