const clean = (value: string | undefined) => value?.trim() || undefined;

export const siteConfig = {
  publicationMode:
    import.meta.env.VITE_PUBLICATION_MODE === "production"
      ? ("production" as const)
      : ("preview" as const),
  operatorName: clean(import.meta.env.VITE_OPERATOR_NAME),
  supportEmail: clean(import.meta.env.VITE_SUPPORT_EMAIL),
};

export const isPreview = siteConfig.publicationMode === "preview";

