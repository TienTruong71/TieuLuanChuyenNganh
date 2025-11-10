import asyncHandler from 'express-async-handler'
import RevenueReport from '../../models/revenueReportModel.js'
import PDFDocument from 'pdfkit'
import path from 'path'
import fs from 'fs'

// [GET] /api/manager/revenue-report
// Lấy toàn bộ báo cáo hoặc lọc theo tháng, năm
// Access: Private (Manager)
export const getRevenueReports = asyncHandler(async (req, res) => {
  const { month, year } = req.query

  let filter = {}
  if (month) filter.month = month
  if (year) filter.year = year

  const reports = await RevenueReport.find(filter).sort({ year: -1, month: -1 })

  if (!reports || reports.length === 0) {
    return res.status(404).json({ message: 'Không có báo cáo' })
  }

  res.status(200).json({
    total: reports.length,
    reports,
  })
})

// [GET] /api/manager/revenue-report/pdf?month=...&year=...
// Xuất file PDF báo cáo doanh thu
// Access: Private (Manager)
export const exportRevenueReportPDF = asyncHandler(async (req, res) => {
  const { month, year } = req.query

  if (!month || !year) {
    return res.status(400).json({ message: 'Vui lòng chọn tháng và năm' })
  }

  const report = await RevenueReport.findOne({ month, year })

  if (!report) {
    return res.status(404).json({ message: 'Không có báo cáo' })
  }

  // Tạo PDF bằng pdfkit
  const doc = new PDFDocument()
  const filePath = path.join(
    process.cwd(),
    `revenue-report-${month}-${year}.pdf`
  )
  const writeStream = fs.createWriteStream(filePath)
  doc.pipe(writeStream)

  doc.fontSize(20).text('BÁO CÁO DOANH THU', { align: 'center' })
  doc.moveDown(1)

  doc.fontSize(14).text(`Tháng: ${month}`)
  doc.text(`Năm: ${year}`)
  doc.text(`Tổng doanh thu: ${parseFloat(report.total_revenue).toLocaleString()} VND`)
  doc.moveDown(2)
  doc.text(`Ngày tạo: ${report.createdAt.toLocaleString()}`)
  doc.text(`Ngày cập nhật: ${report.updatedAt.toLocaleString()}`)

  doc.end()

  writeStream.on('finish', () => {
    res.download(filePath, (err) => {
      if (err) console.error(err)
      fs.unlinkSync(filePath) 
    })
  })
})

// [POST] /api/manager/revenue-report/create
export const createRevenueReport = asyncHandler(async (req, res) => {
  const { month, year, total_revenue } = req.body

  if (!month || !year || !total_revenue) {
    return res.status(400).json({ message: 'Thiếu dữ liệu đầu vào' })
  }

  const exist = await RevenueReport.findOne({ month, year })
  if (exist) {
    return res.status(400).json({ message: 'Báo cáo tháng này đã tồn tại' })
  }

  const report = await RevenueReport.create({
    month,
    year,
    total_revenue,
  })

  res.status(201).json({
    message: 'Tạo báo cáo thành công',
    report,
  })
})