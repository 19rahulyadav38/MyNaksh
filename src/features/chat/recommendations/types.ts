export type RecommendationCta = {
  label: string;
  /** Opaque, server-driven action, e.g. a deep link. */
  action?: string;
};

type BaseRecommendation = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  cta?: RecommendationCta;
};

export type GemstoneRecommendation = BaseRecommendation & {
  type: 'gemstone';
  planet?: string;
  priceFrom?: number;
};

export type TarotRecommendation = BaseRecommendation & {
  type: 'tarot';
  cardCount?: number;
};

export type ConsultationRecommendation = BaseRecommendation & {
  type: 'consultation';
  astrologerName?: string;
  pricePerMinute?: number;
};

export type ArticleRecommendation = BaseRecommendation & {
  type: 'article';
  readTimeMinutes?: number;
};

export type PromotionRecommendation = BaseRecommendation & {
  type: 'promotion';
  discountLabel?: string;
};

export type Recommendation =
  | GemstoneRecommendation
  | TarotRecommendation
  | ConsultationRecommendation
  | ArticleRecommendation
  | PromotionRecommendation;

export type RecommendationType = Recommendation['type'];
