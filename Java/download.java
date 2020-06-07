package spider;

import org.apache.http.Header;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpHead;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;

import java.io.*;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class filedownload {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpHead httpHead = new HttpHead("http://127.0.0.1:3000/1.rar");

        CloseableHttpClient httpClient = HttpClients.createDefault();
        CloseableHttpResponse response=httpClient.execute(httpHead);
        Header firstHeader = response.getFirstHeader("Content-Length");
        System.out.printf(firstHeader.getValue());


        ExecutorService service = Executors.newFixedThreadPool(100);
        int total=Integer.parseInt(firstHeader.getValue());

        RandomAccessFile file = new RandomAccessFile("./dd.rar", "rw");
        file.setLength(total);

        int threads=5;
        int blocksize=total/threads;
        int start=0;
        int end=0;
        CountDownLatch countDownLatch=new CountDownLatch(threads);
        for (int i = 0; i <threads ; i++) {
            start=i*blocksize;
            end=i==threads-1?total-1:i*blocksize+blocksize-1;
            System.out.printf("%d_%d \n",start,end);

            int finalStart = start;
            int finalEnd = end;
            Runnable run = new Runnable() {
                @Override
                public void run() {
                    HttpGet httpGet = new HttpGet("http://127.0.0.1:3000/1.rar");
                    httpGet.setHeader("Range", "bytes=" + finalStart + "-" + finalEnd);
                    try {
                        CloseableHttpResponse response=httpClient.execute(httpGet);
                        writeFile(response,file,finalStart);
                        countDownLatch.countDown();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }

                }
            };
            service.execute(run);
        }
        countDownLatch.await();
        file.close();
        service.shutdown();

    }

    private synchronized static void writeFile(HttpResponse response, RandomAccessFile file,int start){
        try (
                InputStream inputStream = response.getEntity().getContent();
        ) {
            byte[] buffer = new byte[1024];
            int ch;
            file.seek(start);
            while ((ch = inputStream.read(buffer)) != -1) {
                file.write(buffer, 0, ch);
            }


        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}