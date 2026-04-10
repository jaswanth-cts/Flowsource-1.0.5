package ${{values.java_package_name}}.controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import ${{values.java_package_name}}.service.SampleService;
import org.springframework.beans.factory.annotation.Autowired;


    @RestController
    public class SampleController {
        @Autowired
        private SampleService sampleService;

        @GetMapping("/hello")
        public String hello() {
            return sampleService.helloService();
        }
        @GetMapping("/failure")
        public String failure() {
            return sampleService.failure();
        }

        @GetMapping("ignore")
        public String ignore(){
            return sampleService.ignoreException();
        }

        @GetMapping("slow")
        public String slow(){
            return sampleService.slow();
        }
    }

