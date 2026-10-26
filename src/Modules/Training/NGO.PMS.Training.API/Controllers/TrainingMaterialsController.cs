using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Training.Application.Commands.AddTrainingMaterial;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Training.API.Controllers;

[ApiController]
[Route("api/v1/training-materials")]
[Authorize]
public class TrainingMaterialsController : ControllerBase
{
    private readonly ISender _sender;
    public TrainingMaterialsController(ISender sender) => _sender = sender;

    [HttpPost]
    [RequirePermission("training.materials.create")]
    public async Task<IActionResult> Add(AddTrainingMaterialCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/training-materials/{id}", new { id });
    }
}
