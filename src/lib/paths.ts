export const paths = {
  home: "/",
  auth: {
    signIn: "/sign-in",
  },
  dashboard: {
    admin: "/admin",
    student: "/student",
    teacher: "/teacher",
    parent: "/parent",
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
