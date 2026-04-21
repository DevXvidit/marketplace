const crypto = require('crypto');
const User = require('../models/User');
const { forgotPassword } = require('../controllers/authController');
const { sendPasswordResetEmail } = require('../services/emailService');

jest.mock('../models/User');
jest.mock('../services/emailService');

describe('authController - forgotPassword', () => {
  let req, res;

  beforeEach(() => {
    req = { body: { email: 'test@example.com' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    User.findOne.mockReset();
    sendPasswordResetEmail.mockReset();
  });

  it('should generate a secure reset code and hash it correctly', async () => {
    const mockUser = {
      email: 'test@example.com',
      save: jest.fn().mockResolvedValue(true),
    };
    User.findOne.mockResolvedValue(mockUser);

    await forgotPassword(req, res);

    expect(mockUser.resetPasswordToken).toBeDefined();
    expect(mockUser.resetPasswordExpires).toBeDefined();
    expect(mockUser.save).toHaveBeenCalledWith({ validateBeforeSave: false });
    expect(sendPasswordResetEmail).toHaveBeenCalled();

    const resetCodeUsed = sendPasswordResetEmail.mock.calls[0][1];

    // Check reset code meets criteria (6 digits)
    expect(resetCodeUsed).toMatch(/^[0-9]{6}$/);

    // Verify hashing works
    const hashedCode = crypto.createHash('sha256').update(resetCodeUsed).digest('hex');
    expect(mockUser.resetPasswordToken).toBe(hashedCode);
  });
});
