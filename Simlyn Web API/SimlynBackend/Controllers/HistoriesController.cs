using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SimlynBackend.Helpers;
using SimlynBackend.Models;

namespace SimlynBackend.Controllers
{
    [Produces("application/json")]
    [Route("api/Histories")]
    public class HistoriesController : Controller
    {
        [HttpGet]
        public List<Flashdata> Get()
        {
            return new HistoryHelper().GetHistoryItems();
        }

    }
}