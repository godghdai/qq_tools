//F:\puppeteer\ffmpeg
#include <libavutil/timestamp.h>
#include <libavformat/avformat.h>

const int AUDIO_STREAM_INDEX = 0;
const int VIDEO_STREAM_INDEX = 1;

int init_fmt_ctx(AVFormatContext **ctx, char *filename) {
    if (avformat_open_input(ctx, filename, 0, 0) < 0) {
        fprintf(stderr, "Could not open input file '%s'", filename);
        return -1;
    }
    if (avformat_find_stream_info(*ctx, 0) < 0) {
        fprintf(stderr, "Failed to retrieve input stream information");
        return -1;
    }
    av_dump_format(*ctx, 0, filename, 0);
    return 1;
}

int copy_avcodec_parameters(AVFormatContext *out_fmt_ctx, AVFormatContext *in_fmt_ctx, int index) {
    AVStream *in_stream = in_fmt_ctx->streams[0];
    AVStream *out_stream = avformat_new_stream(out_fmt_ctx, NULL);
    if (!out_stream) {
        fprintf(stderr, "Failed allocating output stream\n");
        return -1;
    }
    out_stream->index = index;
    if (avcodec_parameters_copy(out_stream->codecpar, in_stream->codecpar) < 0) {
        fprintf(stderr, "Failed to copy codec parameters\n");
        return -1;
    }
    out_stream->codecpar->codec_tag = 0;
    return 1;
}

int write_frame(AVFormatContext *in_fmt_ctx, AVFormatContext *out_fmt_ctx, int stream_index) {
    AVRational in_time_base = in_fmt_ctx->streams[0]->time_base;
    AVRational out_time_base = out_fmt_ctx->streams[stream_index]->time_base;
    AVPacket pkt;
    while (1) {

        if (av_read_frame(in_fmt_ctx, &pkt) < 0)
            break;

        pkt.stream_index = stream_index;
        pkt.pts = av_rescale_q_rnd(pkt.pts, in_time_base, out_time_base, AV_ROUND_NEAR_INF | AV_ROUND_PASS_MINMAX);
        pkt.dts = av_rescale_q_rnd(pkt.dts, in_time_base, out_time_base, AV_ROUND_NEAR_INF | AV_ROUND_PASS_MINMAX);
        pkt.duration = av_rescale_q(pkt.duration, in_time_base, out_time_base);
        pkt.pos = -1;

        if (av_interleaved_write_frame(out_fmt_ctx, &pkt) < 0) {
            fprintf(stderr, "Error muxing packet\n");
            av_packet_unref(&pkt);
            break;
        }
        av_packet_unref(&pkt);
    }

}

int main(int argc, char **argv) {
    char *in_audio_filename = "F://puppeteer/ffmpeg/宋祖英 - 辣妹子_audio.m4s";
    char *in_video_filename = "F://puppeteer/ffmpeg/宋祖英 - 辣妹子_video.m4s";
    char *out_filename = "F://puppeteer/ffmpeg/宋祖英 - 十八弯水路到我家MV.mp4";
    AVFormatContext *in_audio_fmt_ctx = NULL;
    AVFormatContext *in_video_fmt_ctx = NULL;
    if (init_fmt_ctx(&in_audio_fmt_ctx, in_audio_filename) < 0) goto end;
    if (init_fmt_ctx(&in_video_fmt_ctx, in_video_filename) < 0) goto end;

    AVFormatContext *out_fmt_ctx = NULL;
    avformat_alloc_output_context2(&out_fmt_ctx, NULL, NULL, out_filename);
    if (!out_fmt_ctx) {
        fprintf(stderr, "Could not create output context\n");
        goto end;
    }

    if (copy_avcodec_parameters(out_fmt_ctx, in_audio_fmt_ctx, AUDIO_STREAM_INDEX) < 0) goto end;
    if (copy_avcodec_parameters(out_fmt_ctx, in_video_fmt_ctx, VIDEO_STREAM_INDEX) < 0) goto end;

    if (!(out_fmt_ctx->flags & AVFMT_NOFILE)) {
        if (avio_open(&out_fmt_ctx->pb, out_filename, AVIO_FLAG_WRITE) < 0) {
            fprintf(stderr, "Could not open output file '%s'", out_filename);
            goto end;
        }
    }

    if (avformat_write_header(out_fmt_ctx, NULL) < 0) {
        fprintf(stderr, "Error occurred when opening output file\n");
        goto end;
    }

    write_frame(in_audio_fmt_ctx, out_fmt_ctx, AUDIO_STREAM_INDEX);
    write_frame(in_video_fmt_ctx, out_fmt_ctx, VIDEO_STREAM_INDEX);

    av_write_trailer(out_fmt_ctx);

    end:

    if (in_audio_fmt_ctx)
        avformat_close_input(&in_audio_fmt_ctx);

    if (in_video_fmt_ctx)
        avformat_close_input(&in_video_fmt_ctx);

    if (out_fmt_ctx)
        avformat_free_context(out_fmt_ctx);


}
