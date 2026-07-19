import type { Access, CollectionConfig } from 'payload'

// Администратор управляет всем, включая пользователей.
// Редактор работает с контентом, но раздел «Пользователи» ему недоступен —
// может менять только собственные данные (например, пароль).
const isAdmin: Access = ({ req: { user } }) => user?.role === 'admin'

const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'admin') return true
  return { id: { equals: user.id } }
}

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Пользователь',
    plural: 'Пользователи',
  },
  admin: {
    useAsTitle: 'email',
    group: 'Настройки',
    description: 'Кто может входить в админку.',
    hidden: ({ user }) => user?.role !== 'admin',
  },
  auth: true,
  access: {
    create: isAdmin,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
    delete: isAdmin,
    unlock: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Имя',
    },
    {
      name: 'role',
      type: 'select',
      label: 'Роль',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Администратор', value: 'admin' },
        { label: 'Редактор', value: 'editor' },
      ],
      admin: {
        description:
          'Редактор ведёт контент сайта. Администратор дополнительно управляет пользователями.',
      },
      access: {
        // Роль назначает только администратор — редактор не может повысить себя
        create: ({ req }) => req.user?.role === 'admin',
        update: ({ req }) => req.user?.role === 'admin',
      },
    },
  ],
}
