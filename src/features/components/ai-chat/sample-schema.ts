export const loginSchema = {
  root: 'login-card',
  elements: {
    'login-card': {
      type: 'Card',
      props: {
        title: 'Login Form',
      },
      children: ['email', 'password', 'remember', 'submit'],
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

    remember: {
      type: 'Checkbox',
      props: {
        label: 'Remember me',
      },
    },

    submit: {
      type: 'Button',
      props: {
        label: 'Sign In',
      },
    },
  },
}