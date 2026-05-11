// Tipos que mapean las respuestas reales de Moodle 5.1.1 / 2025100601
// URL base: https://aulavirtual.pds.edu.ar

export interface MoodleSiteInfo {
  sitename: string;
  username: string;
  firstname: string;
  lastname: string;
  fullname: string;
  lang: string;
  userid: number;
  siteurl: string;
  userpictureurl: string;
  functions: Array<{ name: string; version: string }>;
  moodleversion: string;
  release: string;
  version: string;
  mobilecssurl: string;
}

export interface MoodleCourse {
  id: number;
  shortname: string;
  fullname: string;
  displayname: string;
  visible: number;
  summary: string;
  startdate: number; // Unix timestamp
  enddate: number;   // Unix timestamp
  categoryid: number;
  categoryname?: string;
}

export interface MoodleUser {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  fullname: string;
  email: string;
  department: string;
  profileimageurl: string;
  roles?: Array<{ roleid: number; name: string; shortname: string }>;
}

export interface MoodleSearchUsersResponse {
  users: MoodleUser[];
  warnings: unknown[];
}

// ─── Gradebook ────────────────────────────────────────────────────────────────
export interface MoodleGradeItem {
  id: number;
  itemname: string | null;      // null para el total del curso
  itemtype: string;             // 'course' | 'category' | 'mod'
  itemmodule: string | null;    // 'assign' | 'quiz' | 'forum' | etc.
  grademin: number;
  grademax: number;
  graderaw: number | null;      // null = sin nota
  gradepercent: number | null;
  gradeformatted: string;       // ya formateado por Moodle ej: "7.50"
  feedback: string | null;
}

export interface MoodleUserGrades {
  userid: number;
  userfullname: string;
  gradeitems: MoodleGradeItem[];
}

// Respuesta de error estándar de Moodle
export interface MoodleErrorResponse {
  exception: string;
  errorcode: string;
  message: string;
  debuginfo?: string;
}

// Interfaz que deben implementar los adaptadores (v1 y v2)
export interface IMoodleAdapter {
  getSiteInfo(): Promise<MoodleSiteInfo>;
  getCourses(): Promise<MoodleCourse[]>;
  getEnrolledUsers(courseId: number): Promise<MoodleUser[]>;
  searchUsers(query: string): Promise<MoodleUser[]>;
  getGradeItems(courseId: number, userId: number): Promise<MoodleUserGrades>;
}
