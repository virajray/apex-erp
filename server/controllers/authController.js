// When user logs in, send back their branch info
const login = async (req, res) => {
  const { email, password } = req.body;

  // Find user in database
  const user = await prisma.user.findUnique({
    where: { email },
    include: { branch: true } // Also get branch details
  });

  if (!user || user.password !== password) { // In real app: use bcrypt.compare
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Create JWT token with branch info
  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      role: user.role,
      branchId: user.branchId,
      branchName: user.branch?.name || null
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      branchId: user.branchId,
      branchName: user.branch?.name
    }
  });
};