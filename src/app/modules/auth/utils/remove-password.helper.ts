export const removePassword = <T>(user: T): Omit<T, 'password'> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userWithoutPassword } = user as unknown as {
    password: string
  }

  return userWithoutPassword as Omit<T, 'password'>
}
