using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Documents;
using SimlynBackend.Helpers;
using SimlynBackend.Models;

namespace SimlynBackend.Controllers
{
    [Produces("application/json")]
    [Route("api/History")]
    public class HistoryController : Controller
    {
        [HttpPost]
        public Task<Document> Post([FromForm]Flashdata flashdata)
        {
            Flashdata _flashdata = new Flashdata
            {
                Message = flashdata.Message,
                Amount = flashdata.Amount,
                DateTime = DateTime.Now.ToString(),
                ReceiverAddress = flashdata.ReceiverAddress,
                Coordinates = flashdata.Coordinates
            };

            return new HistoryHelper().CreateHistoryItem(_flashdata);
        }
    }
}