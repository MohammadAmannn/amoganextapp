export const sampleSchema = {
  root: 'card1',
  elements: {
    card1: {
      type: 'Card',
      props: {
        title: 'Login Form',
      },
      children: ['email', 'password'],
    },

    email: {
      type: 'Input',
      props: {
        label: 'Email',
        placeholder: 'Enter email',
      },
    },

    password: {
      type: 'Input',
      props: {
        label: 'Password',
        placeholder: 'Enter password',
      },
    },
  },
}