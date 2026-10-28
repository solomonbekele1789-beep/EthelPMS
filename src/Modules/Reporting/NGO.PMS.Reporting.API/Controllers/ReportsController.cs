using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Reporting.Application.Reports.Commands.AddReportComment;
using NGO.PMS.Reporting.Application.Reports.Commands.AddReportDataEntry;
using NGO.PMS.Reporting.Application.Reports.Commands.ApproveReport;
using NGO.PMS.Reporting.Application.Reports.Commands.CreateReport;
using NGO.PMS.Reporting.Application.Reports.Commands.CreateReportSection;
using NGO.PMS.Reporting.Application.Reports.Commands.RejectReport;
using NGO.PMS.Reporting.Application.Reports.Commands.SubmitReport;
using NGO.PMS.Reporting.Application.Reports.Commands.UpdateReport;
using NGO.PMS.Reporting.Application.Reports.Queries.GetApprovalHistory;
using NGO.PMS.Reporting.Application.Reports.Queries.GetFinancialSummary;
using NGO.PMS.Reporting.Application.Reports.Queries.GetReport;
using NGO.PMS.Reporting.Application.Reports.Queries.ListReports;
using NGO.PMS.Reporting.Domain.Enums;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Reporting.API.Controllers;

[ApiController]
[Route("api/v1/reports")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly ISender _sender;
    public ReportsController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("reporting.reports.read")]
    public async Task<IActionResult> List(
        [FromQuery] Guid? projectId,
        [FromQuery] ReportType? reportType,
        [FromQuery] ReportStatus? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
        => Ok(await _sender.Send(new ListReportsQuery(projectId, reportType, status, page, pageSize)));

    [HttpGet("{id:guid}")]
    [RequirePermission("reporting.reports.read")]
    public async Task<IActionResult> Get(Guid id)
        => Ok(await _sender.Send(new GetReportQuery(id)));

    [HttpPost]
    [RequirePermission("reporting.reports.create")]
    public async Task<IActionResult> Create(CreateReportCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(Get), new { id }, new { id });
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("reporting.reports.update")]
    public async Task<IActionResult> Update(Guid id, UpdateReportCommand command)
    {
        if (id != command.ReportId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPost("{id:guid}/submit")]
    [RequirePermission("reporting.reports.submit")]
    public async Task<IActionResult> Submit(Guid id)
    {
        await _sender.Send(new SubmitReportCommand(id));
        return NoContent();
    }

    [HttpPost("{id:guid}/approve")]
    [RequirePermission("reporting.reports.approve")]
    public async Task<IActionResult> Approve(Guid id, ApproveReportCommand command)
    {
        if (id != command.ReportId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPost("{id:guid}/reject")]
    [RequirePermission("reporting.reports.approve")]
    public async Task<IActionResult> Reject(Guid id, RejectReportCommand command)
    {
        if (id != command.ReportId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    // ── Sections ────────────────────────────────────────

    [HttpPost("{id:guid}/sections")]
    [RequirePermission("reporting.reports.update")]
    public async Task<IActionResult> AddSection(Guid id, CreateReportSectionCommand command)
    {
        if (id != command.ReportId) return BadRequest();
        var sectionId = await _sender.Send(command);
        return Created($"api/v1/reports/{id}/sections/{sectionId}", new { id = sectionId });
    }

    // ── Data Entries ────────────────────────────────────

    [HttpPost("sections/{sectionId:guid}/data")]
    [RequirePermission("reporting.reports.update")]
    public async Task<IActionResult> AddDataEntry(Guid sectionId, AddReportDataEntryCommand command)
    {
        if (sectionId != command.ReportSectionId) return BadRequest();
        var entryId = await _sender.Send(command);
        return Created($"api/v1/reports/sections/{sectionId}/data/{entryId}", new { id = entryId });
    }

    // ── Comments ────────────────────────────────────────

    [HttpPost("{id:guid}/comments")]
    [RequirePermission("reporting.reports.read")]
    public async Task<IActionResult> AddComment(Guid id, AddReportCommentCommand command)
    {
        if (id != command.ReportId) return BadRequest();
        var commentId = await _sender.Send(command);
        return Created($"api/v1/reports/{id}/comments/{commentId}", new { id = commentId });
    }

    // ── Approval History ────────────────────────────────

    [HttpGet("{id:guid}/approvals")]
    [RequirePermission("reporting.reports.read")]
    public async Task<IActionResult> GetApprovalHistory(Guid id)
        => Ok(await _sender.Send(new GetApprovalHistoryQuery(id)));

    // ── Financial Summary ───────────────────────────────

    [HttpGet("financial-summary")]
    [RequirePermission("reporting.reports.read")]
    public async Task<IActionResult> GetFinancialSummary(
        [FromQuery] Guid projectId,
        [FromQuery] int? fiscalYear)
        => Ok(await _sender.Send(new GetFinancialSummaryQuery(projectId, fiscalYear)));
}
