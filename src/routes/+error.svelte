<script lang="ts">
	import { page } from '$app/state'
	$inspect(page.error)
</script>

<div class="container-fluid my-3">
	<h1>
		{page.status}
	</h1>
	<p>
		{page.error?.message ?? '未知错误'}
	</p>
	<a class="btn btn-outline-primary" href="/">页面出错啦, 点击返回首页</a>
</div>
