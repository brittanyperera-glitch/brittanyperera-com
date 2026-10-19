export type Video = { id: string; title: string };

export const thumbUrl = (id: string) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;

export const embedUrl = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
