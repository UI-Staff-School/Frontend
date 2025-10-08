export const paths = {
  home: "/",
  auth: {
    signIn: "/sign-in",
    signUp: "/sign-up",
  },
  dashboard: {
    admin: "/(dashboard)/admin",
    student: "/(dashboard)/student",
    teacher: "/(dashboard)/teacher",
    parent: "/(dashboard)/parent",
  },
  api: {
    auth: {
      signin: "/api/auth/signin",
      signup: "/api/auth/signup",
      me: "/api/auth/me",
      signout: "/api/auth/signout",
    },
  },
} as const;

export type AppPaths = typeof paths;
