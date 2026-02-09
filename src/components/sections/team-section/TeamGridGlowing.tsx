import GlowingCards, { GlowingCard } from "../../lightswind/glowing-cards";

export type SocialLink = {
  label: "facebook" | "twitter" | "instagram" | "linkedin" | "github" | string;
  href: string;
};

export type TeamMember = {
  id?: string | number;
  name: string;
  role?: string;
  bio?: string;
  image: string; // pass URL string from Astro
  socials?: SocialLink[];
};

type Props = {
  members: TeamMember[];
};

export default function TeamGridGlowing({ members }: Props) {
  return (
    <GlowingCards>
      {members.map((m, idx) => (
        <GlowingCard
          key={m.id ?? `${m.name}-${idx}`}
          className="group relative overflow-hidden rounded-2xl border-2 bg-white p-6 transition-all duration-300"
        >
          {/* Avatar */}
          <div className="relative mx-auto mb-5 h-28 w-28">
            <div className="avatar-wrap h-28 w-28 overflow-hidden rounded-full shadow-md ring-1 ring-black/5">
              <img
                src={m.image}
                alt={m.name}
                className="avatar h-28 w-28 object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>

          {/* Text content */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">{m.name}</h3>
            {m.role && (
              <p className="mt-0.5 text-sm font-medium text-primary">
                {m.role}
              </p>
            )}
            {m.bio && (
              <p className="mt-3 line-clamp-3 text-sm text-gray-600">{m.bio}</p>
            )}
          </div>
        </GlowingCard>
      ))}
    </GlowingCards>
  );
}
