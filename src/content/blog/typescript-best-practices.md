---
title: "TypeScript Best Practices for Large-Scale Applications"
description: "Move beyond basic TypeScript and learn the patterns that keep large codebases maintainable — discriminated unions, utility types, Zod validation, and strict compiler configuration."
pubDate: 2026-05-25
author: "Protize Team"
tags: ["typescript", "best-practices", "architecture", "clean-code", "javascript"]
category: "TypeScript"
coverImage: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=2031&auto=format&fit=crop"
coverAlt: "Developer looking at code on multiple monitors"
---

TypeScript has become the standard for serious JavaScript development. But there's a meaningful difference between *using* TypeScript and *using TypeScript well*. Many teams adopt TypeScript expecting it to solve all their bugs, then find their codebase is filled with `any` types, complex generics nobody can read, and types that say one thing while the runtime does another.

The truth is that TypeScript's value is proportional to how thoroughly you apply it. In this blog, we'll cover the patterns that genuinely make a difference in large codebases — the ones that make refactoring safe, bugs catch-at-compile-time instead of catch-in-production, and onboarding new developers straightforward.

---

## 1. Enable Strict Mode and Beyond

The most impactful thing you can do is enable strict mode in your `tsconfig.json`. Many developers create a project, see a few type errors, and turn off the checks that cause them. This defeats the entire purpose.

```json
{
  "compilerOptions": {
    // Enable all strict checks in one flag
    "strict": true,

    // These are not included in "strict" but are equally valuable:

    // Array access returns T | undefined, not just T
    "noUncheckedIndexedAccess": true,

    // Optional properties must be explicitly undefined, not just missing
    "exactOptionalPropertyTypes": true,

    // All code paths must return a value
    "noImplicitReturns": true,

    // No fallthrough in switch cases
    "noFallthroughCasesInSwitch": true,

    // Unused variables/parameters are errors, not warnings
    "noUnusedLocals": true,
    "noUnusedParameters": true,

    // Case-sensitive file imports (critical for Linux deployments)
    "forceConsistentCasingInFileNames": true,

    // Skip lib checks for faster compilation (safe for most projects)
    "skipLibCheck": true
  }
}
```

`noUncheckedIndexedAccess` is particularly eye-opening. Without it:

```typescript
const users = ['Alice', 'Bob'];
const first = users[0]; // TypeScript says: string ✅
first.toUpperCase();    // TypeScript is happy, but first could be undefined!
```

With it:

```typescript
const users = ['Alice', 'Bob'];
const first = users[0]; // TypeScript says: string | undefined 🎯
first.toUpperCase();    // ERROR: Object is possibly 'undefined'

// Forces you to handle it properly:
if (first !== undefined) {
  first.toUpperCase(); // ✅ Safe
}
// Or:
users[0]?.toUpperCase(); // ✅ Optional chaining
```

---

## 2. Never Use `any` — Use `unknown` Instead

`any` is TypeScript's emergency exit. When you write `any`, you're telling the compiler "trust me, I know what this is" — and then it trusts you for all subsequent operations, providing zero safety.

```typescript
// ❌ The any trap — looks fine, breaks at runtime
function processApiResponse(data: any) {
  // TypeScript says: no problem!
  // Runtime says: TypeError: Cannot read property 'name' of undefined
  return data.user.name.toUpperCase();
}

// ✅ The unknown pattern — forces you to be honest
function processApiResponse(data: unknown) {
  // TypeScript forces you to narrow the type before using it
  if (
    typeof data === 'object' &&
    data !== null &&
    'user' in data &&
    typeof (data as any).user === 'object' &&
    (data as any).user !== null &&
    'name' in (data as any).user &&
    typeof (data as any).user.name === 'string'
  ) {
    return (data as { user: { name: string } }).user.name.toUpperCase();
  }
  throw new Error('Unexpected API response shape');
}
```

The `unknown` version is more verbose, but that's the point — it forces you to think about and handle every edge case explicitly.

For API responses, use **Zod** (covered later) to make this ergonomic.

---

## 3. Discriminated Unions — Model State Correctly

This is one of the most powerful TypeScript patterns and one of the most underused. A discriminated union is a union type where each member has a common literal field (the discriminant) that identifies which variant you're dealing with.

### The Problem Without Discriminated Unions

```typescript
// ❌ Bad — this type allows impossible states
interface RequestState {
  isLoading?: boolean;
  data?: User[];
  error?: string;
}

// This is technically valid but makes no sense:
const badState: RequestState = {
  isLoading: true,
  data: [someUser],    // How can you have data AND be loading?
  error: 'Something went wrong', // AND have an error?
};
```

### Discriminated Unions Make Impossible States Impossible

```typescript
// ✅ Good — each state is explicit, mutually exclusive, and complete
type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string; code?: number };

// TypeScript exhaustively checks every case
function renderContent(state: RequestState<User[]>) {
  switch (state.status) {
    case 'idle':
      return <EmptyState />;

    case 'loading':
      return <Spinner />;

    case 'success':
      // TypeScript KNOWS state.data exists here — it's in the type
      return <UserList users={state.data} />;

    case 'error':
      // TypeScript KNOWS state.message exists here
      return <ErrorBanner message={state.message} />;

    default:
      // This will cause a type error if you add a new variant
      // and forget to handle it — exhaustive checking
      const _exhaustive: never = state;
      return null;
  }
}
```

Real-world usage with React hooks:

```typescript
// hooks/usePosts.ts
import { useState, useEffect } from 'react';
import { Post } from '@/types';

type PostsState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; posts: Post[]; total: number }
  | { status: 'error'; message: string };

export function usePosts(page: number) {
  const [state, setState] = useState<PostsState>({ status: 'idle' });

  useEffect(() => {
    setState({ status: 'loading' });

    fetch(`/api/posts?page=${page}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => setState({ status: 'success', posts: data.posts, total: data.total }))
      .catch(error => setState({ status: 'error', message: error.message }));
  }, [page]);

  return state;
}

// In component:
function BlogPage() {
  const state = usePosts(1);

  if (state.status === 'loading') return <Spinner />;
  if (state.status === 'error') return <Error message={state.message} />;
  if (state.status === 'success') {
    // state.posts is available, fully typed
    return <PostList posts={state.posts} />;
  }
  return null;
}
```

---

## 4. Master Utility Types

TypeScript ships with over 20 built-in utility types. Learning them means you write less boilerplate and stay DRY:

```typescript
// The base User type — full database model
interface User {
  id: number;
  email: string;
  name: string;
  passwordHash: string;     // Never expose this
  role: 'admin' | 'editor' | 'reader';
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Omit — remove sensitive/irrelevant fields
type PublicUser = Omit<User, 'passwordHash'>;
// Result: { id, email, name, role, bio?, createdAt, updatedAt }

// Pick — keep only specific fields
type UserSummary = Pick<User, 'id' | 'name' | 'role'>;
// Result: { id, name, role }

// Partial — all fields optional (for PATCH operations)
type UpdateUserDto = Partial<Pick<User, 'name' | 'bio'>>;
// Result: { name?: string, bio?: string }

// Required — all fields required (opposite of Partial)
type CompleteUser = Required<User>;

// Readonly — prevent mutation
type ImmutableUser = Readonly<User>;

// Record — map type
type RolePermissions = Record<User['role'], string[]>;
// Result: { admin: string[], editor: string[], reader: string[] }

// ReturnType — extract return type from a function
async function getUser(id: number) {
  return prisma.user.findUnique({ where: { id } });
}
type GetUserReturn = Awaited<ReturnType<typeof getUser>>;
// Type is automatically inferred from the function — stays in sync

// Parameters — extract parameter types
type GetUserParams = Parameters<typeof getUser>;
// Result: [id: number]
```

---

## 5. Zod — Runtime Type Safety

TypeScript types disappear at runtime. When data comes from external sources — API responses, form submissions, URL params, environment variables — you have no compile-time guarantee that the shape is what you expect.

**Zod** solves this by letting you define schemas that validate data at runtime AND infer TypeScript types:

```bash
npm install zod
```

```typescript
// schemas/user.schema.ts
import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(255, 'Email is too long'),

  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),

  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// TypeScript type is automatically inferred from the schema
export type RegisterInput = z.infer<typeof RegisterSchema>;
// { email: string, name: string, password: string, confirmPassword: string }
```

```typescript
// In a Next.js API Route (app/api/auth/register/route.ts)
import { RegisterSchema } from '@/schemas/user.schema';

export async function POST(request: Request) {
  const body = await request.json();

  // Validate and parse in one step
  const result = RegisterSchema.safeParse(body);

  if (!result.success) {
    // result.error.flatten() gives you a clean error object
    return Response.json({
      error: 'Validation failed',
      details: result.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  // result.data is fully typed as RegisterInput
  const { email, name, password } = result.data;
  // ... proceed with registration
}
```

```typescript
// In a React form with React Hook Form
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterSchema, RegisterInput } from '@/schemas/user.schema';

function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema), // Same schema validates the form!
  });

  return (
    <form onSubmit={handleSubmit(async (data) => {
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    })}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}

      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Register</button>
    </form>
  );
}
```

The same Zod schema validates both the form on the frontend and the API request on the backend — **one source of truth for validation rules**.

---

## 6. Custom Generic Utilities

Create your own utility types for patterns that repeat in your codebase:

```typescript
// utils/types.ts

// Make selected fields optional (inverse of Required<Pick<T>>)
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Make selected fields required
type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// Deep readonly — makes nested objects immutable too
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

// Extract promise type
type Awaited<T> = T extends Promise<infer U> ? U : T;

// Non-nullable version of a type
type NonNullable<T> = T extends null | undefined ? never : T;

// Usage examples:
interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  publishedAt?: Date;
}

// For creating a post — id and slug are auto-generated
type CreatePostInput = Omit<Post, 'id' | 'slug'>;

// For updating a post — everything optional except id
type UpdatePostInput = RequiredBy<Partial<Post>, 'id'>;
// { id: number, title?: string, content?: string, ... }
```

---

## 7. Template Literal Types

TypeScript's template literal types let you define types that are combinations of string literals:

```typescript
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type ApiVersion = 'v1' | 'v2';
type Resource = 'users' | 'posts' | 'comments';

// Build valid endpoint strings at the type level
type ApiEndpoint = `/${ApiVersion}/${Resource}`;
// "/v1/users" | "/v1/posts" | "/v1/comments" | "/v2/users" | etc.

// Event name patterns
type EventName = `on${Capitalize<string>}`;
// onSubmit, onClick, onChange — all valid

// CSS property names
type CSSProperty = `${'margin' | 'padding'}-${'top' | 'right' | 'bottom' | 'left'}`;
// "margin-top" | "margin-right" | "padding-top" | etc.

// Route params
type ExtractParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<Rest>
    : T extends `${string}:${infer Param}`
    ? Param
    : never;

type Params = ExtractParams<'/users/:userId/posts/:postId'>;
// 'userId' | 'postId'
```

---

## Conclusion

TypeScript's value comes from committing to it fully. Enable strict mode and additional checks, avoid `any` like it's a code smell (because it is), model your state with discriminated unions, leverage utility types instead of copying interfaces, validate runtime data with Zod, and build custom generic utilities for patterns you use repeatedly.

These practices compound. A codebase that applies all of them becomes increasingly pleasant to work in over time — refactors are safe, bugs surface at compile time instead of production, and new team members can understand the code's intent just by reading the types.
