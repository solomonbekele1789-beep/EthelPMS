using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Training.Application.Commands.CreateTrainer;
using NGO.PMS.Training.Application.Queries.ListTrainers;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Training.API.Controllers;

[ApiController]
[Route("api/v1/trainers")]
[Authorize]
public class TrainersController : ControllerBase
{
    private readonly ISender _sender;
    public TrainersController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("training.trainers.read")]
    public async Task<IActionResult> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
        => Ok(await _sender.Send(new ListTrainersQuery(page, pageSize)));

    [HttpPost]
    [RequirePermission("training.trainers.create")]
    public async Task<IActionResult> Create(CreateTrainerCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/trainers/{id}", new { id });
    }
}
