const PDFDocument = require('pdfkit');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');

exports.generateCertificate = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // Check if enrolled and completed
    const enrollment = await Enrollment.findOne({ student: userId, course: courseId }).populate('course');
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found.' });
    }

    if (!enrollment.completed) {
      return res.status(403).json({ success: false, message: 'You must complete the course to get a certificate.' });
    }

    const course = enrollment.course;
    const instructor = await User.findById(course.instructor);

    // Create PDF
    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Certificate_${course.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    
    doc.pipe(res);

    // Draw Certificate Background/Border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).lineWidth(10).stroke('#4f46e5'); // Brand color
    doc.rect(35, 35, doc.page.width - 70, doc.page.height - 70).lineWidth(2).stroke('#e2e8f0');

    // Content
    doc.moveDown(3);
    doc.fontSize(40).font('Helvetica-Bold').fillColor('#1e293b').text('Certificate of Completion', { align: 'center' });
    doc.moveDown(1);
    
    doc.fontSize(20).font('Helvetica').fillColor('#64748b').text('This is to certify that', { align: 'center' });
    doc.moveDown(0.5);
    
    doc.fontSize(35).font('Helvetica-Bold').fillColor('#4f46e5').text(req.user.name, { align: 'center' });
    doc.moveDown(0.5);
    
    doc.fontSize(20).font('Helvetica').fillColor('#64748b').text('has successfully completed the course', { align: 'center' });
    doc.moveDown(0.5);
    
    doc.fontSize(28).font('Helvetica-Bold').fillColor('#1e293b').text(course.title, { align: 'center' });
    doc.moveDown(3);
    
    // Signatures / Dates
    const signatureY = doc.y;
    
    // Date
    doc.fontSize(14).font('Helvetica').fillColor('#64748b').text('Date Completed:', 100, signatureY);
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#1e293b').text(enrollment.updatedAt.toDateString(), 100, signatureY + 20);
    doc.moveTo(100, signatureY + 45).lineTo(300, signatureY + 45).lineWidth(1).stroke('#cbd5e1');

    // Instructor
    doc.fontSize(14).font('Helvetica').fillColor('#64748b').text('Instructor:', doc.page.width - 300, signatureY);
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#1e293b').text(instructor.name, doc.page.width - 300, signatureY + 20);
    doc.moveTo(doc.page.width - 300, signatureY + 45).lineTo(doc.page.width - 100, signatureY + 45).lineWidth(1).stroke('#cbd5e1');

    // Platform Logo
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#94a3b8').text('Adhi EduBuddy LMS', 50, doc.page.height - 70, { align: 'center' });

    doc.end();

  } catch (error) {
    next(error);
  }
};
