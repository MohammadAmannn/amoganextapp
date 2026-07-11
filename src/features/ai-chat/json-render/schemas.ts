export const pricingPageSchema = {
  root: 'pricing-page',
  elements: {
    'pricing-page': {
      type: 'Stack',
      props: {
        direction: 'vertical',
        gap: 'lg',
        align: 'center',
      },
      children: ['header', 'pricing-cards'],
    },
    header: {
      type: 'Stack',
      props: {
        direction: 'vertical',
        gap: 'md',
        align: 'center',
      },
      children: ['title', 'subtitle'],
    },
    title: {
      type: 'Heading',
      props: {
        level: '1',
        children: 'Simple, Transparent Pricing',
      },
    },
    subtitle: {
      type: 'Text',
      props: {
        children: 'Choose the perfect plan for your needs. Always flexible to scale.',
        size: 'lg',
      },
    },
    'pricing-cards': {
      type: 'Stack',
      props: {
        direction: 'horizontal',
        gap: 'lg',
        align: 'start',
      },
      children: ['starter-card', 'pro-card'],
    },
    'starter-card': {
      type: 'Card',
      props: {
        title: 'Starter',
        description: 'Perfect for individuals and small projects',
        className: 'w-80',
      },
      children: ['starter-price', 'starter-features', 'starter-button'],
    },
    'starter-price': {
      type: 'Price',
      props: {
        amount: '$29',
        period: '/month',
      },
    },
    'starter-features': {
      type: 'FeatureList',
      props: {
        features: [
          'Up to 5 projects',
          '2 GB storage',
          'Community support',
          'Basic analytics',
        ],
      },
    },
    'starter-button': {
      type: 'Button',
      props: {
        label: 'Get Started',
        variant: 'default',
        className: 'w-full',
      },
    },
    'pro-card': {
      type: 'Card',
      props: {
        title: 'Professional',
        description: 'Ideal for growing teams',
        className: 'w-80 border-primary',
      },
      children: ['pro-price', 'pro-features', 'pro-button'],
    },
    'pro-price': {
      type: 'Price',
      props: {
        amount: '$79',
        period: '/month',
      },
    },
    'pro-features': {
      type: 'FeatureList',
      props: {
        features: [
          'Unlimited projects',
          '100 GB storage',
          'Priority email support',
          'Advanced analytics',
          'Team collaboration',
        ],
      },
    },
    'pro-button': {
      type: 'Button',
      props: {
        label: 'Start Free Trial',
        variant: 'default',
        className: 'w-full',
      },
    },
  },
}
